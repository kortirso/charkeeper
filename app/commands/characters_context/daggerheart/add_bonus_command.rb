# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class AddBonusCommand < BaseCommand
      use_contract do
        config.messages.namespace = :character_bonus

        params do
          required(:character).filled(type?: ::Daggerheart::Character)
          required(:comment).filled(:string)
          required(:value).hash do
            optional(:traits).hash do
              optional(:str).filled(:integer)
              optional(:agi).filled(:integer)
              optional(:fin).filled(:integer)
              optional(:ins).filled(:integer)
              optional(:pre).filled(:integer)
              optional(:know).filled(:integer)
            end
            optional(:health).filled(:integer)
            optional(:stress).filled(:integer)
            optional(:evasion).filled(:integer)
            optional(:armor_score).filled(:integer)
            optional(:thresholds).hash do
              optional(:major).filled(:integer)
              optional(:severe).filled(:integer)
            end
            optional(:attack).filled(:integer)
            optional(:proficiency).filled(:integer)
          end
        end
      end

      private

      def do_persist(input)
        result = ::Character::Bonus.create!(input)

        { result: result }
      end
    end
  end
end
