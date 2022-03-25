import app from "../../../app";

class Auth {
  async registerUser(login: string, password: string, salt: string, email: string) {
    try {
      const sql = `
        INSERT INTO users (login, password, salt, email)
          VALUES (
            $1, '${password}', '${salt}', $2
          ) RETURNING id;
      `;
      const { rows } = await app.db.query(sql, [login, email]);
      return rows[0].id
    } catch (error) {
      return error
    }  
  }
}

export default new Auth