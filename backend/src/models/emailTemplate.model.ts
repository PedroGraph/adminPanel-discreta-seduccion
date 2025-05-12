export const emailTemplateFieldSelector = {
    id: true,
    name: true,
    subject: true,
    type: true,
    status: true,
    description: true,
    html: true,
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

export const emailCampaignFields = {
   id: true,
   name: true,
   subject: true,
   status: true,
}

export const emailCampaignSelector = {
      id: true,
      name: true,
      subject: true,
      status: true,
      template:{
        select:{
          id: true,
          name: true
        }
      },
      recipients: {
        select: {
          opened: true,
          clicked: true,
        },
      },
}