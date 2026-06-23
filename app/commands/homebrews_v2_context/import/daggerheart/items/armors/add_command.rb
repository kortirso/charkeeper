# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Items
        module Armors
          class AddCommand < BaseCommand
            include Deps[
              refresh_bonuses: 'commands.bonuses_context.refresh'
            ]

            # rubocop: disable Metrics/BlockLength
            use_contract do
              BonusTypes = Dry::Types['strict.string'].enum('static', 'dynamic')

              params do
                required(:user).filled(type?: ::User)
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
                  required(:tier).filled(:integer, gteq?: 1, lteq?: 4)
                  required(:base_score).filled(:integer, gteq?: 1, lteq?: 12)
                  required(:bonuses).hash do
                    required(:thresholds).maybe(:array).each(:hash) do
                      required(:major).filled(:integer, gteq?: 1, lteq?: 100)
                      required(:severe).filled(:integer, gteq?: 1, lteq?: 100)
                    end
                  end
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
              input[:kind] = 'armor'
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
