# frozen_string_literal: true

module BonusesContext
  class ConsumeCommand < BaseCommand
    use_contract do
      params do
        required(:character).filled(type?: ::Character)
        required(:character_bonus).filled(type?: ::Character::Bonus)
        required(:from_state).filled(:string)
        required(:character_item).filled(type?: ::Character::Item)
      end
    end

    private

    def do_prepare(input)
      input[:attributes] = {
        bonusable: input[:character],
        value: input[:character_bonus].value,
        dynamic_value: input[:character_bonus].dynamic_value,
        comment: input[:character_bonus].bonusable.name[I18n.locale.to_s]
      }
    end

    def do_persist(input)
      result = Character::Bonus.create!(input[:attributes])

      input[:character_item].states[input[:from_state]] -= 1
      input[:character_item].save!

      { result: result }
    end
  end
end
