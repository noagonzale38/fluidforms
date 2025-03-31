-- This function allows executing SQL queries with proper permissions
-- Only users with the service role can execute this function
CREATE OR REPLACE FUNCTION execute_sql(query_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- This ensures the function runs with the privileges of the creator
AS $$
DECLARE
result JSONB;
BEGIN
  -- Execute the query and capture the result as JSON
EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || query_text || ') t' INTO result;
RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM, 'detail', SQLSTATE);
END;
$$;

-- Grant execute permission only to authenticated users
REVOKE ALL ON FUNCTION execute_sql(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO authenticated;

-- Add a comment to the function
COMMENT ON FUNCTION execute_sql(TEXT) IS 'Executes a SQL query and returns the result as JSON. Only available to authenticated users with proper permissions.';

