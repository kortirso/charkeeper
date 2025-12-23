# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    module Bonuses
      class AddCommand < BaseCommand
        # rubocop: disable Metrics/BlockLength
        use_contract do
          config.messages.namespace = :character_bonus

          params do
            required(:bonusable).filled(type_included_in?: [::Daggerheart::Character])
            required(:comment).filled(:string)
            optional(:value).hash do
              optional(:traits).hash do
                optional(:str).filled(:integer)
                optional(:agi).filled(:integer)
                optional(:fin).filled(:integer)
                optional(:ins).filled(:integer)
                optional(:pre).filled(:integer)
                optional(:know).filled(:integer)
              end
              optional(:thresholds).hash do
                optional(:major).filled(:integer)
                optional(:severe).filled(:integer)
              end
              optional(:health).filled(:integer)
              optional(:stress).filled(:integer)
              optional(:hope).filled(:integer)
              optional(:evasion).filled(:integer)
              optional(:armor_score).filled(:integer)
              optional(:attack).filled(:integer)
              optional(:proficiency).filled(:integer)
            end
            optional(:dynamic_value).hash do
              optional(:traits).hash do
                optional(:str).filled(:string)
                optional(:agi).filled(:string)
                optional(:fin).filled(:string)
                optional(:ins).filled(:string)
                optional(:pre).filled(:string)
                optional(:know).filled(:string)
              end
              optional(:thresholds).hash do
                optional(:major).filled(:string)
                optional(:severe).filled(:string)
              end
              optional(:health).filled(:string)
              optional(:stress).filled(:string)
              optional(:hope).filled(:string)
              optional(:evasion).filled(:string)
              optional(:armor_score).filled(:string)
              optional(:attack).filled(:string)
            end
          end
        end
        # rubocop: enable Metrics/BlockLength

        private

        def do_persist(input)
          result = ::Character::Bonus.create!(input)

          { result: result }
        end
      end
    end
  end
end
