# frozen_string_literal: true

module CharactersContext
  module Dc20
    module Bonuses
      class AddCommand < BaseCommand
        # rubocop: disable Metrics/BlockLength
        use_contract do
          config.messages.namespace = :character_bonus

          params do
            required(:bonusable).filled(type_included_in?: [::Dc20::Character])
            required(:comment).filled(:string)
            optional(:value).hash do
              optional(:abilities).hash do
                optional(:mig).filled(:integer)
                optional(:agi).filled(:integer)
                optional(:int).filled(:integer)
                optional(:cha).filled(:integer)
              end
              optional(:saves).hash do
                optional(:mig).filled(:integer)
                optional(:agi).filled(:integer)
                optional(:int).filled(:integer)
                optional(:cha).filled(:integer)
              end
              optional(:physical_save).filled(:integer)
              optional(:mental_save).filled(:integer)
              optional(:combat_mastery).filled(:integer)
              optional(:initiative).filled(:integer)
              optional(:ad).filled(:integer)
              optional(:pd).filled(:integer)
              optional(:attack).filled(:integer)
              optional(:hp).filled(:integer)
              optional(:sp).filled(:integer)
              optional(:mp).filled(:integer)
              optional(:speed).filled(:integer)
            end
            optional(:dynamic_value).hash do
              optional(:abilities).hash do
                optional(:mig).filled(:string)
                optional(:agi).filled(:string)
                optional(:int).filled(:string)
                optional(:cha).filled(:string)
              end
              optional(:saves).hash do
                optional(:mig).filled(:string)
                optional(:agi).filled(:string)
                optional(:int).filled(:string)
                optional(:cha).filled(:string)
              end
              optional(:physical_save).filled(:string)
              optional(:mental_save).filled(:string)
              optional(:combat_mastery).filled(:string)
              optional(:initiative).filled(:string)
              optional(:ad).filled(:string)
              optional(:pd).filled(:string)
              optional(:attack).filled(:string)
              optional(:hp).filled(:string)
              optional(:sp).filled(:string)
              optional(:mp).filled(:string)
              optional(:speed).filled(:string)
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
