# frozen_string_literal: true

# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Tailwind is built into app/assets/builds and must be declared explicitly.
Rails.application.config.assets.precompile << 'tailwind.css'

# Add additional assets to the asset load path.
# Rails.application.config.assets.paths << Emoji.images_path
