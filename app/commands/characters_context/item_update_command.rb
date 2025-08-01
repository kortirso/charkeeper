# frozen_string_literal: true

module CharactersContext
  class ItemUpdateCommand < BaseCommand
    use_contract do
      config.messages.namespace = :character_item

      params do
        required(:character_item).filled(type?: ::Character::Item)
        optional(:quantity).filled(:integer)
        optional(:ready_to_use).filled(:bool)
        optional(:notes).maybe(:string)
      end

      rule(:ready_to_use, :character_item) do
        next if values[:ready_to_use].blank?
        next if values[:ready_to_use] == false
        next unless values[:character_item].item.kind == 'armor'
        next unless values[:character_item].character.items.ready_to_use.joins(:item).exists?(items: { kind: 'armor' })

        key(:ready_to_use).failure(:only_one)
      end
    end

    private

    def do_persist(input)
      input[:character_item].update!(input.except(:character_item))

      { result: input[:character_item] }
    end
  end
end
