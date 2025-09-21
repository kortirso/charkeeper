# frozen_string_literal: true

module CharactersContext
  class ItemUpdateCommand < BaseCommand
    READY_TO_USE_STATES = %w[hands equipment].freeze

    use_contract do
      config.messages.namespace = :character_item

      States = Dry::Types['strict.string'].enum(*::Character::Item.states.keys)

      params do
        required(:character_item).filled(type?: ::Character::Item)
        optional(:quantity).filled(:integer)
        optional(:ready_to_use).filled(:bool)
        optional(:notes).maybe(:string)
        optional(:state).filled(States)
      end

      # rubocop: disable Rails/Present
      rule(:ready_to_use, :state, :character_item) do
        next if values[:ready_to_use].blank? && values[:state].blank?
        next if !values[:ready_to_use].blank? && values[:ready_to_use] == false
        next if !values[:state].blank? && READY_TO_USE_STATES.exclude?(values[:state])
        next unless values[:character_item].item.kind == 'armor'
        next unless values[:character_item].character.items.ready_to_use.joins(:item).exists?(items: { kind: 'armor' })

        key(:ready_to_use).failure(:only_one)
      end
      # rubocop: enable Rails/Present
    end

    private

    def do_persist(input)
      input[:character_item].update!(input.except(:character_item))

      { result: input[:character_item] }
    end
  end
end
