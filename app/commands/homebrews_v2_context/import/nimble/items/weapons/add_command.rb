# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Nimble
      module Items
        module Weapons
          class AddCommand < BaseCommand
            # rubocop: disable-next Metrics/BlockLength
            use_contract do
              Types = Dry::Types['strict.string'].enum('melee', 'range')
              Skills = Dry::Types['strict.string'].enum('str', 'dex')
              Tooltips = Dry::Types['strict.string'].enum('light', 'thrown', 'vicious')

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
                  required(:price).filled(:integer, gteq?: 1, lteq?: 1_000_000)
                end
                required(:info).hash do
                  required(:burden).filled(:integer, gteq?: 1, lteq?: 2)
                  required(:type).filled(Types)
                  required(:weapon_skill).filled(Skills)
                  required(:damage).filled(:string)
                  required(:damage_type).filled(:string)
                  optional(:tooltips).maybe(:array).each(Tooltips)
                  optional(:range).filled(:integer, gteq?: 1)
                  optional(:load).filled(:integer, gteq?: 1)
                  optional(:features).maybe(:array).each(:hash) do
                    required(:en).filled(:string, max_size?: 250)
                    optional(:ru).maybe(:string, max_size?: 250)
                    optional(:es).maybe(:string, max_size?: 250)
                  end
                end
                optional(:req).hash
                optional(:tooltip_req).hash
                optional(:modifiers).hash
                optional(:public).filled(:bool)
              end
            end

            private

            def do_prepare(input)
              input[:name].transform_values! { |value| sanitize(value) }
              input[:kind] = 'weapon'
            end

            def do_persist(input)
              result = ::Nimble::Item.create!(input)

              { result: result }
            end
          end
        end
      end
    end
  end
end
