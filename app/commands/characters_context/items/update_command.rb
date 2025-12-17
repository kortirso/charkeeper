# frozen_string_literal: true

module CharactersContext
  module Items
    class UpdateCommand < BaseCommand
      READY_TO_USE_STATES = %w[hands equipment].freeze

      use_contract do
        config.messages.namespace = :character_item

        States = Dry::Types['strict.string'].enum(*::Character::Item.states.keys)

        params do
          required(:character_item).filled(type?: ::Character::Item)
          optional(:notes).maybe(:string, max_size?: 500)
          optional(:states).hash
          # DEPRECATED
          optional(:quantity).filled(:integer)
          optional(:state).filled(States)
          optional(:ready_to_use).filled(:bool)
        end

        # rubocop: disable Rails/Present
        rule(:ready_to_use, :state, :character_item, :states) do
          next if values[:states].present?
          next if values[:ready_to_use].blank? && values[:state].blank?
          next if !values[:ready_to_use].blank? && values[:ready_to_use] == false
          next if !values[:state].blank? && READY_TO_USE_STATES.exclude?(values[:state])
          next unless values[:character_item].item.kind == 'armor'
          next unless values[:character_item].character.items.where(state: ::Character::Item::ACTIVE_STATES).joins(:item).exists?(items: { kind: 'armor' }) # rubocop: disable Layout/LineLength

          key(:ready_to_use).failure(:only_one)
        end
        # rubocop: enable Rails/Present
      end

      private

      def do_prepare(input) # rubocop: disable Metrics/AbcSize
        if input.key?(:states)
          input[:state] = input[:states].slice('hands', 'equipment').values.sum.positive? ? 'hands' : 'backpack'
          input[:quantity] = input[:states].values.sum
        elsif input.key?(:state)
          input[:states] = ::Character::Item.default_states.merge({ input[:state] => input[:character_item].quantity })
        elsif input.key?(:quantity)
          input[:states] = ::Character::Item.default_states.merge({ input[:character_item].state => input[:quantity] })
        end
      end

      def do_persist(input)
        input[:character_item].update!(input.except(:character_item))

        { result: input[:character_item] }
      end
    end
  end
end
