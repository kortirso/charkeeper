# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Pathfinder2
      module Items
        module Armors
          class AddCommand < BaseCommand
            # rubocop: disable-next Metrics/BlockLength
            use_contract do
              Groups = Dry::Types['strict.string'].enum('cloth', 'leather', 'chain', 'composite', 'plate')
              Skills = Dry::Types['strict.string'].enum('unarmored', 'light', 'medium', 'heavy')

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
                required(:info).hash do
                  required(:group).filled(Groups)
                  required(:armor_skill).filled(Skills)
                  required(:ac).filled(:integer, gteq?: 0)
                  required(:str_req).maybe(:integer, gteq?: 0)
                  required(:dex_max).filled(:integer, gteq?: 0)
                  required(:skills_penalty).maybe(:integer, lt?: 0)
                  required(:speed_penalty).maybe(:integer, lt?: 0)
                  required(:tooltips).maybe(:array).each(:string)
                  optional(:features).maybe(:array).each(:hash) do
                    required(:en).filled(:string, max_size?: 250)
                    optional(:ru).maybe(:string, max_size?: 250)
                    optional(:es).maybe(:string, max_size?: 250)
                  end
                end
                optional(:modifiers).hash
                optional(:public).filled(:bool)
              end
            end

            private

            def do_prepare(input)
              input[:name].transform_values! { |value| sanitize(value) }
              input[:description].transform_values! { |value| sanitize(value) }
              input[:kind] = 'armor'
            end

            def do_persist(input)
              result = ::Pathfinder2::Item.create!(input)

              { result: result }
            end
          end
        end
      end
    end
  end
end
