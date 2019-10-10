module.exports = {
    id: {
        type: 'uuid',
        primary: true,
    },
    email: {
        type: 'string',
        unique: true,
        required: true,
        email: true,
    },
    name: {
        type: 'string',
        required: true,
        index: true,
    },
    skills: {
        type: 'nodes',
        target: 'Skill',
        relationship: 'HAS_SKILL',
        direction: 'out',
        eager: true,
    },
};