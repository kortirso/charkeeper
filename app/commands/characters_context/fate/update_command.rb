# frozen_string_literal: true

module CharactersContext
  module Fate
    class UpdateCommand < BaseCommand
      include Deps[
        cache: 'cache.avatars'
      ]

      use_contract do
        config.messages.namespace = :fate_character

        params do
          required(:character).filled(type?: ::Fate::Character)
          optional(:name).filled(:string, max_size?: 50)
          optional(:file)
        end
      end

      private

      def do_persist(input)
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
