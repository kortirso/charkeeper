# frozen_string_literal: true

module CharactersContext
  module Dnd5
    class ItemUpdateCommand < BaseCommand
      use_contract do
        params do
          required(:character_item).filled(type?: ::Dnd5::Character::Item)
          optional(:quantity).filled(:integer)
          optional(:ready_to_use).filled(:bool)
        end
      end

      private

      def do_persist(input)
        input[:character_item].update!(input.except(:character_item))

        { result: input[:character_item].reload }
      end
    end
  end
end
