import * as React from "react"
import {
    Controller,
    FormProvider,
    useFormContext,
    useFormState,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

const FormFieldContext = React.createContext({})

function FormField(props) {
    return (
        <FormFieldContext.Provider value={{ name: props.name }}>
            <Controller {...props} />
        </FormFieldContext.Provider>
    )
}

function useFormField() {
    const fieldContext = React.useContext(FormFieldContext)
    const itemContext = React.useContext(FormItemContext)
    const { getFieldState } = useFormContext()
    const formState = useFormState({ name: fieldContext.name })
    const fieldState = getFieldState(fieldContext.name, formState)

    if (!fieldContext?.name) {
        throw new Error("useFormField debe usarse dentro de <FormField>")
    }

    const { id } = itemContext

    return {
        id,
        name: fieldContext.name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...fieldState,
    }
}

const FormItemContext = React.createContext({})

function FormItem({ className, ...props }) {
    const id = React.useId()
    return (
        <FormItemContext.Provider value={{ id }}>
            <div className={cn("space-y-2", className)} {...props} />
        </FormItemContext.Provider>
    )
}

function FormLabel({ className, ...props }) {
    const { error, formItemId } = useFormField()
    return (
        <Label
            className={cn(error && "text-destructive", className)}
            htmlFor={formItemId}
            {...props}
        />
    )
}

// Sin Slot de Radix: clonamos el único hijo (el <Input>, <Select>, etc.)
// para inyectarle id y atributos de accesibilidad, sin envolverlo en un
// elemento extra.
function FormControl({ children, ...props }) {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
    const describedBy = !error
        ? formDescriptionId
        : `${formDescriptionId} ${formMessageId}`

    return React.cloneElement(children, {
        id: formItemId,
        "aria-describedby": describedBy,
        "aria-invalid": !!error,
        ...props,
    })
}

function FormDescription({ className, ...props }) {
    const { formDescriptionId } = useFormField()
    return (
        <p
            id={formDescriptionId}
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    )
}

function FormMessage({ className, children, ...props }) {
    const { error, formMessageId } = useFormField()
    const body = error ? String(error?.message ?? "") : children

    if (!body) return null

    return (
        <p
            id={formMessageId}
            className={cn("text-sm font-medium text-destructive", className)}
            {...props}
        >
            {body}
        </p>
    )
}

export {
    useFormField,
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
    FormField,
}