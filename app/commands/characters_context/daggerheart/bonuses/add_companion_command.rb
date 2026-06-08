# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    module Bonuses
      class AddCompanionCommand < BaseCommand
        ONLY_ADD_TYPE_FIELDS = %i[stress_max evasion damage_bonus].freeze

        use_contract do
          config.messages.namespace = :character_bonus

          params do
            required(:bonusable).filled(type?: ::Daggerheart::Character::Companion)
            required(:comment).filled(:string)
            optional(:value).hash do
              # values are integers, with add type
              optional(:stress_max).hash
              optional(:evasion).hash
              optional(:damage_bonus).hash
            end
          end

          def variables
            @variables ||=
              {
                level: 1
              }
          end

          def formula = Charkeeper::Container.resolve('formula')

          rule(:value) do
            next if value.blank?

            ONLY_ADD_TYPE_FIELDS.each do |key|
              next if value[key].blank?

              key(:ability).failure(:only_add) unless value.dig(key, :type) == 'add'
              key(:ability).failure(:invalid_formula) if formula.call(formula: value.dig(key, :value), variables: variables).nil?
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
end
