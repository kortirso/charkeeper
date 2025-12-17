# frozen_string_literal: true

module CharactersContext
  module Items
    class AddCommand < BaseCommand
      use_contract do
        params do
          required(:character).filled(type?: ::Character)
          required(:item).filled(type?: ::Item)
        end
      end

      private

      def do_persist(input)
        character_item = ::Character::Item.find_by(input)

        if character_item
          character_item.update!(
            quantity: character_item.quantity + 1,
            states: (character_item.states.presence || ::Character::Item.default_states).merge({
              'backpack' => character_item.states['backpack'].to_i + 1
            })
          )
        else
          character_item =
            ::Character::Item.create!(input.merge(states: ::Character::Item.default_states.merge({ 'backpack' => 1 })))
        end

        { result: character_item }
      end
    end
  end
end
