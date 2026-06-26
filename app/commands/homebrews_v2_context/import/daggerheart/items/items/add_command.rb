# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Items
        module Items
          class AddCommand < BaseCommand
            include Deps[
              refresh_bonuses: 'commands.bonuses_context.refresh'
            ]

            use_contract do
              BonusTypes = Dry::Types['strict.string'].enum('static', 'dynamic')
              Kinds = Dry::Types['strict.string'].enum('item', 'recipe')

              params do
                required(:user).filled(type?: ::User)
                required(:kind).filled(Kinds)
                required(:name).hash do
                  required(:en).filled(:string, max_size?: 50)
                  optional(:ru).maybe(:string, max_size?: 50)
                  optional(:es).maybe(:string, max_size?: 50)
                end
                required(:description).hash do
                  optional(:en).maybe(:string, max_size?: 500)
                  optional(:ru).maybe(:string, max_size?: 500)
                  optional(:es).maybe(:string, max_size?: 500)
                end
                optional(:bonuses).maybe(:array).each(:hash) do
                  required(:id).filled(type?: Integer)
                  required(:type).filled(BonusTypes)
                  required(:value).hash
                end
                optional(:public).filled(:bool)
              end
            end

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
