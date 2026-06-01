# frozen_string_literal: true

module CharactersContext
  module Cthulhu7
    class CreateCommand < BaseCommand
      use_contract do
        config.messages.namespace = :cthulhu7_character

        params do
          required(:user).filled(type?: User)
          required(:name).filled(:string, max_size?: 50)
          optional(:skip_guide).filled(:bool)
        end
      end

      private

      def do_prepare(input)
        input[:data] = { guide_step: input[:skip_guide] ? nil : 1 }
      end

      def do_persist(input)
        character = ::Cthulhu7::Character.create!(input.slice(:user, :name, :data))

        { result: character }
      end
    end
  end
end
