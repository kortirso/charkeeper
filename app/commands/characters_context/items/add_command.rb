# frozen_string_literal: true

module CharactersContext
  module Items
    class AddCommand < BaseCommand
      use_contract do
        params do
          required(:character).filled(type?: ::Character)
          required(:item).filled(type?: ::Item)
          optional(:state).filled(:string)
        end
      end

      private

      def lock_key(input) = "character_item_add_#{input[:character].id}_#{input[:item]&.id}"
      def lock_time = 0

      def do_prepare(input)
        input[:state] ||= 'backpack'
      end

      def do_persist(input) # rubocop: disable Metrics/AbcSize
        character_item = ::Character::Item.find_by(input.slice(:character, :item))

        if character_item
          character_item.update!(
            quantity: character_item.quantity + 1,
            state: character_item.states.slice('hands', 'equipment').values.sum.positive? ? 'hands' : 'backpack',
            states: (character_item.states.presence || ::Character::Item.default_states).merge({
              'backpack' => character_item.states['backpack'].to_i + 1
            })
          )
        else
          character_item =
            ::Character::Item.create!(
              input.merge(
                quantity: 1,
                state: input[:state],
                states: ::Character::Item.default_states.merge({ input[:state] => 1 })
              )
            )
        end

        { result: character_item }
      end
    end
  end
end
