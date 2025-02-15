# frozen_string_literal: true

module CharactersContext
  module Dnd5
    class ItemAddCommand < BaseCommand
      use_contract do
        params do
          required(:character).filled(type_included_in?: [::Dnd5::Character, ::Dnd2024::Character])
          required(:item).filled(type?: ::Dnd5::Item)
        end
      end

      private

      def do_persist(input)
        character_item =
          ::Dnd5::Character::Item.find_by(input)&.increment!(:quantity) ||
            ::Dnd5::Character::Item.create!(input)

        { result: character_item }
      end
    end
  end
end
