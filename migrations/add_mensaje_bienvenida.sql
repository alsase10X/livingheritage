-- Migración: Añadir campos de mensaje de bienvenida
-- Fecha: 2025-01-XX
-- Descripción: Añade campos para gestionar el mensaje de bienvenida del bien

ALTER TABLE bienes 
ADD COLUMN IF NOT EXISTS generar_bienvenida_auto BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS mensaje_bienvenida TEXT;

