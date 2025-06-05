# frozen_string_literal: true

module CharactersContext
  class ItemAddCommand < BaseCommand
    use_contract do
      params do
        required(:character).filled(type?: ::Character)
        required(:item).filled(type?: ::Item)
      end
    end

    private

    def do_persist(input)
      character_item =
        ::Character::Item.find_by(input)&.increment!(:quantity) ||
          ::Character::Item.create!(input)

      { result: character_item }
    end
  end
end
