const validateRepoUrl = (req, res, next) => {
    const { repoUrl } = req.body;

    if (
        !repoUrl ||
        typeof repoUrl !== 'string' ||
        !repoUrl.startsWith('https://github.com/')
    ) {
        return res.status(400).json({
            error: 'Invalid GitHub repository URL'
        });
    }

    return next();
};

export { validateRepoUrl };