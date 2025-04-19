export const emailTemplateFieldSelector = {
    id: true,
    name: true,
    subject: true,
    type: true,
    status: true,
    description: true,
    lastEditedBy: {
        select: {
            id: true,
            name: true,
        },
    },
    createdBy: {
        select: {
            id: true,
            name: true,
        },
    },
}