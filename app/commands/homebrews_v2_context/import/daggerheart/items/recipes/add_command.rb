# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Items
        module Recipes
          class AddCommand < BaseCommand
            use_contract do
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
                optional(:public).filled(:bool)
              end
            end

            private

            def do_prepare(input)
              input[:name].transform_values! { |value| sanitize(value) }
              input[:description].transform_values! { |value| sanitize(value) }
              input[:kind] = 'recipe'
            end

            def do_persist(input)
              result = ::Daggerheart::Item.create!(input)

              { result: result }
            end
          end
        end
      end
    end
  end
end
