# frozen_string_literal: true

module CharactersContext
  class ItemUpdateCommand < BaseCommand
    use_contract do
      params do
        required(:character_item).filled(type?: ::Character::Item)
        optional(:quantity).filled(:integer)
        optional(:ready_to_use).filled(:bool)
        optional(:notes).maybe(:string)
      end
    end

    private

    def do_persist(input)
      input[:character_item].update!(input.except(:character_item))

      { result: input[:character_item] }
    end
  end
end
