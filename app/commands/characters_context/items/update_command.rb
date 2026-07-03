# frozen_string_literal: true

module CharactersContext
  module Items
    class UpdateCommand < BaseCommand
      use_contract do
        config.messages.namespace = :character_item

        params do
          required(:character_item).filled(type?: ::Character::Item)
          optional(:notes).maybe(:string, max_size?: 500)
          optional(:states).hash
          optional(:charges).filled(:integer, gteq?: 0)
        end

        rule(:character_item, :states) do
          next if values[:states].nil?
          next unless values[:character_item].item.kind == 'armor'

          in_hands = values[:states].slice('hands', 'equipment').values.sum
          next if in_hands.zero?

          other_in_hands =
            values[:character_item].character.items
              .where.not(id: values[:character_item].id)
              .where(state: ::Character::Item::ACTIVE_STATES)
              .joins(:item).exists?(items: { kind: 'armor' })
          next if in_hands == 1 && !other_in_hands

          key(:ready_to_use).failure(:only_one)
        end
      end

      private

      def do_prepare(input)
        if input.key?(:states)
          input[:states] = input[:character_item].states.stringify_keys.merge(input[:states].transform_values!(&:to_i))
          input[:state] = input[:states].slice('hands', 'equipment').values.sum.positive? ? 'hands' : 'backpack'
        end
      end

      def do_persist(input)
        if input.key?(:states) && input[:states].values.sum.zero?
          input[:character_item].destroy
        else
          input[:character_item].update!(input.except(:character_item))
        end

        { result: input[:character_item] }
      end
    end
  end
end
