# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Cosmere
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
                optional(:public).filled(:bool)
                optional(:only).maybe(:array, min_size?: 1).each(:string)
                optional(:charges).filled(:integer, gteq?: 1)
              end
            end

            private

            def do_prepare(input)
              input[:slug] = "#{SecureRandom.uuid}-slug"
              input[:name].transform_values! { |value| sanitize(value) }
              input[:description]&.transform_values! { |value| sanitize(value) }
              input[:kind] = 'item'
              input[:info] = input.slice(:only)
            end

            def do_persist(input)
              result = ::Cosmere::Item.create!(input.except(:only))

              { result: result }
            end
          end
        end
      end
    end
  end
end
