# frozen_string_literal: true

module CharactersContext
  module Items
    class AddCommand < BaseCommand
      use_contract do
        params do
          required(:character).filled(type?: ::Character)
          required(:item).filled(type?: ::Item)
          optional(:state).filled(:string)
          optional(:name).filled(:string)
          optional(:modifiers).hash
        end
      end

      private

      def lock_key(input) = "character_item_add_#{input[:character].id}_#{input[:item]&.id}"
      def lock_time = 0

      def do_prepare(input)
        input[:state] ||= 'backpack'
      end

      def do_persist(input) # rubocop: disable Metrics/AbcSize
        character_item = input.key?(:name) ? nil : ::Character::Item.find_by(input.slice(:character, :item).merge(name: nil))

        if input[:item].charges.nil? && character_item
          character_item.update!(
            state: character_item.states.slice('hands', 'equipment').values.sum.positive? ? 'hands' : 'backpack',
            states: (character_item.states.presence || ::Character::Item.default_states).merge({
              'backpack' => character_item.states['backpack'].to_i + 1
            }),
            modifiers: character_item.modifiers.to_h.merge(input[:modifiers].to_h)
          )
        else
          character_item =
            ::Character::Item.create!(
              input.merge({
                state: input[:state],
                states: ::Character::Item.default_states.merge({ input[:state] => 1 }),
                charges: input[:item].charges
              }.compact)
            )
        end

        { result: character_item }
      end
    end
  end
end
