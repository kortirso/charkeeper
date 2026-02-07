# frozen_string_literal: true

module CharactersContext
  module Fate
    class CreateCommand < BaseCommand
      use_contract do
        config.messages.namespace = :fate_character

        params do
          required(:user).filled(type?: User)
          required(:name).filled(:string, max_size?: 50)
        end
      end

      private

      def do_persist(input)
        character = ::Fate::Character.create!(input.slice(:user, :name))

        { result: character }
      end
    end
  end
end
