# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Dnd2024
      module Items
        module Items
          class AddCommand < BaseCommand
            use_contract do
              params do
                required(:user).filled(type?: ::User)
                required(:name).hash do
                  required(:en).filled(:string, max_size?: 50)
                  optional(:ru).maybe(:string, max_size?: 50)
                  optional(:es).maybe(:string, max_size?: 50)
                end
                optional(:description).hash do
                  optional(:en).filled(:string, max_size?: 500)
                  optional(:ru).maybe(:string, max_size?: 500)
                  optional(:es).maybe(:string, max_size?: 500)
                end
                required(:data).hash do
                  required(:price).filled(:integer, gteq?: 0, lteq?: 1_000_000)
                  required(:weight).maybe(:integer, gteq?: 0, lteq?: 10)
                end
                optional(:modifiers).hash
                optional(:charges).filled(:integer, gteq?: 1)
                optional(:public).filled(:bool)
              end
            end

            private

            def do_prepare(input)
              input[:name].transform_values! { |value| sanitize(value) }
              input[:description].transform_values! { |value| sanitize(value) }
              input[:kind] = 'item'
            end

            def do_persist(input)
              result = ::Dnd5::Item.create!(input)

              { result: result }
            end
          end
        end
      end
    end
  end
end
