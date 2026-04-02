const requestStore = new Map()

const createRateLimiter = ({ windowMs, maxRequests }) => {
    return (req, res, next) => {
        const key = `${req.ip}:${req.path}`
        const now = Date.now()
        const entry = requestStore.get(key)

        if (!entry || now > entry.expiresAt) {
            requestStore.set(key, {
                count: 1,
                expiresAt: now + windowMs
            })
            return next()
        }

        if (entry.count >= maxRequests) {
            return res.status(429).json({
                message: "Too many requests, please try again later"
            })
        }

        entry.count += 1
        requestStore.set(key, entry)
        next()
    }
}

module.exports = { createRateLimiter }
