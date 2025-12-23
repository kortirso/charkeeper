# frozen_string_literal: true

module BonusesContext
  class ChangeCommand < BaseCommand
    use_contract do
      config.messages.namespace = :bonus

      params do
        required(:character_bonus).filled(type?: ::Character::Bonus)
        optional(:enabled).filled(:bool)
      end
    end

    private

    def do_persist(input)
      input[:character_bonus].update!(input.except(:character_bonus))

      { result: :ok }
    end
  end
end
