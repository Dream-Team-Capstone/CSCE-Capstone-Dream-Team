# User Settings Implementation

This feature allows users to save their settings (dark mode, high contrast, font size) to their account when they're logged in.

## Database Setup

You need to run the migration to create the user_settings table in your database:

1. Navigate to the `src/Config/migrations` directory
2. Run the SQL script `create_user_settings_table.sql` in your PostgreSQL database:

```bash
psql -U your_username -d your_database_name -f create_user_settings_table.sql
```

Or you can run the SQL directly in your database management tool:

```sql
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    dark_mode BOOLEAN DEFAULT FALSE,
    high_contrast BOOLEAN DEFAULT FALSE,
    font_size INTEGER DEFAULT 14,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## How It Works

1. When a user changes settings on the Settings page, the settings are saved to sessionStorage
2. If the user is logged in, the settings are also saved to their account in the database
3. When a user visits any page, the settingsHandler.js script loads and applies their settings
4. Settings are applied consistently across all pages

## Adding Settings to a Page

To add settings support to a page, include these two lines in the `<head>` section:

```html
<script src="/Scripts/settingsHandler.js" defer></script>
<script src="/Scripts/errorHandling.js" defer></script>
```

And add this hidden input somewhere in your page (preferably near the top):

```html
<input type="hidden" name="isLoggedIn" value="<%= locals.user ? 'true' : 'false' %>">
```

That's it! The settingsHandler.js script will automatically load and apply the user's settings.

## Files Modified/Created

- `app.js` - Added routes for saving and fetching settings
- `src/Controllers/settingsController.js` - Added controller to handle saving and fetching settings
- `src/Config/migrations/create_user_settings_table.sql` - SQL migration for user_settings table
- `src/Views/SettingsPage.ejs` - Updated to use the settingsHandler.js script
- `src/Public/Scripts/settingsHandler.js` - Updated to handle saving and loading settings
- `src/Public/Scripts/errorHandling.js` - Used for displaying error messages

## Testing

1. Register a new user or log in with an existing user
2. Go to the Settings page and change some settings
3. Click Save
4. Navigate to other pages and verify that your settings are applied
5. Log out and log back in
6. Your settings should be applied automatically 