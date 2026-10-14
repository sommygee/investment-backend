
/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User registration and login
 *   - name: User
 *     description: User profile
 *   - name: Plans
 *     description: Available investment plans
 *   - name: Investments
 *     description: User investments
 *   - name: Withdrawals
 *     description: Withdrawal requests
 *   - name: Admin
 *     description: Administrator operations
 *
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       '201':
 *         description: Registration successful
 *       '400':
 *         description: Invalid registration details
 *       '409':
 *         description: Email already registered
 *       '500':
 *         description: Internal server error
 *
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Log in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Login successful; returns a JWT token
 *       '400':
 *         description: Invalid login details
 *       '401':
 *         description: Invalid email or password
 *       '500':
 *         description: Internal server error
 *
 * /api/user/profile:
 *   get:
 *     tags: [User]
 *     summary: Get the logged-in user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User profile retrieved
 *       '401':
 *         description: Authentication required or token invalid
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 *
 * /api/plans:
 *   get:
 *     tags: [Plans]
 *     summary: Get all investment plans
 *     responses:
 *       '200':
 *         description: Investment plans retrieved
 *       '500':
 *         description: Internal server error
 *
 * /api/investments:
 *   post:
 *     tags: [Investments]
 *     summary: Invest in a plan
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [planId]
 *             properties:
 *               planId:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       '201':
 *         description: Investment created successfully
 *       '400':
 *         description: Invalid investment details
 *       '401':
 *         description: Authentication required or token invalid
 *       '404':
 *         description: Investment plan not found
 *       '500':
 *         description: Internal server error
 *   get:
 *     tags: [Investments]
 *     summary: Get the logged-in user's investments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User investments retrieved
 *       '401':
 *         description: Authentication required or token invalid
 *       '500':
 *         description: Internal server error
 *
 * /api/withdrawals:
 *   post:
 *     tags: [Withdrawals]
 *     summary: Submit a withdrawal request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 exclusiveMinimum: 0
 *     responses:
 *       '201':
 *         description: Withdrawal request submitted
 *       '400':
 *         description: Invalid withdrawal details
 *       '401':
 *         description: Authentication required or token invalid
 *       '500':
 *         description: Internal server error
 *
 * /api/admin/test:
 *   get:
 *     tags: [Admin]
 *     summary: Verify admin access
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Admin access confirmed
 *       '401':
 *         description: Authentication required or token invalid
 *       '403':
 *         description: Admin access required
 *
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Users retrieved
 *       '401':
 *         description: Authentication required or token invalid
 *       '403':
 *         description: Admin access required
 *       '500':
 *         description: Internal server error
 *
 * /api/admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get a specific user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       '200':
 *         description: User retrieved
 *       '400':
 *         description: Invalid user ID
 *       '401':
 *         description: Authentication required or token invalid
 *       '403':
 *         description: Admin access required
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 *
 * /api/admin/investments:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users' investments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Investments retrieved
 *       '401':
 *         description: Authentication required or token invalid
 *       '403':
 *         description: Admin access required
 *       '500':
 *         description: Internal server error
 *
 * /api/admin/withdrawals:
 *   get:
 *     tags: [Admin]
 *     summary: Get all withdrawal requests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Withdrawals retrieved
 *       '401':
 *         description: Authentication required or token invalid
 *       '403':
 *         description: Admin access required
 *       '500':
 *         description: Internal server error
 *
 * /api/admin/withdrawals/{id}/approve:
 *   patch:
 *     tags: [Admin]
 *     summary: Approve a pending withdrawal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       '200':
 *         description: Withdrawal approved successfully
 *       '400':
 *         description: Invalid ID or withdrawal already processed
 *       '401':
 *         description: Authentication required or token invalid
 *       '403':
 *         description: Admin access required
 *       '404':
 *         description: Withdrawal not found
 *       '500':
 *         description: Internal server error
 *
 * /api/admin/withdrawals/{id}/reject:
 *   patch:
 *     tags: [Admin]
 *     summary: Reject a pending withdrawal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       '200':
 *         description: Withdrawal rejected successfully
 *       '400':
 *         description: Invalid ID or withdrawal already processed
 *       '401':
 *         description: Authentication required or token invalid
 *       '403':
 *         description: Admin access required
 *       '404':
 *         description: Withdrawal not found
 *       '500':
 *         description: Internal server error
 *
 * /api/admin/plans:
 *   post:
 *     tags: [Admin]
 *     summary: Create an investment plan
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, amount, return, duration]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *               amount:
 *                 type: number
 *                 exclusiveMinimum: 0
 *               return:
 *                 type: number
 *                 exclusiveMinimum: 0
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       '201':
 *         description: Investment plan created
 *       '400':
 *         description: Invalid investment plan details
 *       '401':
 *         description: Authentication required or token invalid
 *       '403':
 *         description: Admin access required
 *       '500':
 *         description: Internal server error
 *
 * /api/admin/plans/{id}:
 *   patch:
 *     tags: [Admin]
 *     summary: Update an investment plan
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, amount, return, duration]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *               amount:
 *                 type: number
 *                 exclusiveMinimum: 0
 *               return:
 *                 type: number
 *                 exclusiveMinimum: 0
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       '200':
 *         description: Investment plan updated
 *       '400':
 *         description: Invalid plan ID or plan details
 *       '401':
 *         description: Authentication required or token invalid
 *       '403':
 *         description: Admin access required
 *       '404':
 *         description: Investment plan not found
 *       '500':
 *         description: Internal server error
 */