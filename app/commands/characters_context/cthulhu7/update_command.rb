# frozen_string_literal: true

module CharactersContext
  module Cthulhu7
    class UpdateCommand < BaseCommand
      include Deps[
        cache: 'cache.avatars'
      ]

      use_contract do
        config.messages.namespace = :cthulhu7_character

        params do
          required(:character).filled(type?: ::Cthulhu7::Character)
          optional(:abilities).hash do
            required(:str).filled(:integer, gteq?: 1, lteq?: 100)
            required(:con).filled(:integer, gteq?: 1, lteq?: 100)
            required(:siz).filled(:integer, gteq?: 1, lteq?: 100)
            required(:dex).filled(:integer, gteq?: 1, lteq?: 100)
            required(:app).filled(:integer, gteq?: 1, lteq?: 100)
            required(:int).filled(:integer, gteq?: 1, lteq?: 100)
            required(:pow).filled(:integer, gteq?: 1, lteq?: 100)
            required(:edu).filled(:integer, gteq?: 1, lteq?: 100)
          end
          optional(:name).filled(:string, max_size?: 50)
          optional(:file)
        end
      end

      private

      def lock_key(input) = "character_update_#{input[:character].id}"
      def lock_time = 0

      def do_prepare(input)
        %i[abilities].each do |key|
          input[key]&.transform_values!(&:to_i)
        end
      end

      def do_persist(input)
        input[:character].data = input[:character].data.attributes.merge(input.except(:character, :file, :name).stringify_keys)
        input[:character].assign_attributes(input.slice(:name))
        input[:character].save!

        upload_avatar(input)

        { result: input[:character] }
      end

      def upload_avatar(input)
        return unless input.key?(:file)

        input[:character].avatar.attach(input[:file])
        cache.push_item(item: input[:character].avatar)
      rescue StandardError => _e
      end
    end
  end
end
