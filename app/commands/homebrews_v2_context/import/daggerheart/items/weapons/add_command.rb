# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Items
        module Weapons
          class AddCommand < BaseCommand
            include Deps[
              refresh_bonuses: 'commands.bonuses_context.refresh'
            ]

            # rubocop: disable Metrics/BlockLength
            use_contract do
              Kinds = Dry::Types['strict.string'].enum('primary weapon', 'secondary weapon')
              Traits = Dry::Types['strict.string'].enum('agi', 'str', 'fin', 'ins', 'pre', 'know')
              Ranges = Dry::Types['strict.string'].enum('melee', 'very close', 'close', 'far', 'very far')
              DamageTypes = Dry::Types['strict.string'].enum('physical', 'magic')
              BonusTypes = Dry::Types['strict.string'].enum('static', 'dynamic')
              Damages = Dry::Types['strict.string'].enum('d4', 'd6', 'd8', 'd10', 'd12', 'd20')

              params do
                required(:user).filled(type?: ::User)
                required(:kind).filled(Kinds)
                required(:name).hash do
                  required(:en).filled(:string, max_size?: 50)
                  optional(:ru).maybe(:string, max_size?: 50)
                  optional(:es).maybe(:string, max_size?: 50)
                end
                required(:description).hash do
                  required(:en).filled(:string, max_size?: 500)
                  optional(:ru).maybe(:string, max_size?: 500)
                  optional(:es).maybe(:string, max_size?: 500)
                end
                optional(:bonuses).maybe(:array).each(:hash) do
                  required(:id).filled(:integer, gteq?: 1, lteq?: 100_000)
                  required(:type).filled(BonusTypes)
                  required(:value).hash
                end
                required(:info).hash do
                  required(:burden).filled(:integer, gteq?: 1, lteq?: 2)
                  required(:tier).filled(:integer, gteq?: 1, lteq?: 4)
                  required(:trait).filled(Traits)
                  required(:range).filled(Ranges)
                  required(:damage_type).filled(DamageTypes)
                  required(:damage).filled(Damages)
                  required(:damage_bonus).filled(:integer, gteq?: 0, lteq?: 20)
                  optional(:features).maybe(:array).each(:hash) do
                    required(:en).filled(:string, max_size?: 250)
                    optional(:ru).maybe(:string, max_size?: 250)
                    optional(:es).maybe(:string, max_size?: 250)
                  end
                end
                optional(:public).filled(:bool)
              end
            end
            # rubocop: enable Metrics/BlockLength

            private

            def do_prepare(input)
              input[:name].transform_values! { |value| sanitize(value) }
              input[:description].transform_values! { |value| sanitize(value) }
            end

            def do_persist(input)
              result = ::Daggerheart::Item.create!(input.except(:bonuses))

              refresh_bonuses.call(bonusable: result, bonuses: input[:bonuses]) if input[:bonuses]

              { result: result }
            end
          end
        end
      end
    end
  end
end
