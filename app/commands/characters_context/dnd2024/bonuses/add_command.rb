# frozen_string_literal: true

module CharactersContext
  module Dnd2024
    module Bonuses
      class AddCommand < BaseCommand
        # rubocop: disable Metrics/BlockLength
        use_contract do
          config.messages.namespace = :character_bonus

          params do
            required(:bonusable).filled(type_included_in?: [::Dnd5::Character, ::Dnd2024::Character])
            required(:comment).filled(:string)
            optional(:value).hash do
              optional(:abilities).hash do
                optional(:str).filled(:integer)
                optional(:dex).filled(:integer)
                optional(:con).filled(:integer)
                optional(:wis).filled(:integer)
                optional(:int).filled(:integer)
                optional(:cha).filled(:integer)
              end
              optional(:saves).hash do
                optional(:str).filled(:integer)
                optional(:dex).filled(:integer)
                optional(:con).filled(:integer)
                optional(:wis).filled(:integer)
                optional(:int).filled(:integer)
                optional(:cha).filled(:integer)
              end
              optional(:initiative).filled(:integer)
              optional(:armor_class).filled(:integer)
              optional(:attack).filled(:integer)
              optional(:speed).filled(:integer)
              optional(:proficiency_bonus).filled(:integer)
            end
            optional(:dynamic_value).hash do
              optional(:abilities).hash do
                optional(:str).filled(:string)
                optional(:dex).filled(:string)
                optional(:con).filled(:string)
                optional(:wis).filled(:string)
                optional(:int).filled(:string)
                optional(:cha).filled(:string)
              end
              optional(:saves).hash do
                optional(:str).filled(:string)
                optional(:dex).filled(:string)
                optional(:con).filled(:string)
                optional(:wis).filled(:string)
                optional(:int).filled(:string)
                optional(:cha).filled(:string)
              end
              optional(:initiative).filled(:string)
              optional(:armor_class).filled(:string)
              optional(:attack).filled(:string)
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
