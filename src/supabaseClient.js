// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://rfvkadlbnztnbfwabhzj.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdmthZGxibnp0bmJmd2FiaHpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NTM2MDgsImV4cCI6MjA3MjMyOTYwOH0.X0msujqaOqm0QI8olJm-h91W13jcIokuFHybUg0nnsQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
