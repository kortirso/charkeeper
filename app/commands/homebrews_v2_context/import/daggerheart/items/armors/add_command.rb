# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Items
        module Armors
          class AddCommand < BaseCommand
            # rubocop: disable Metrics/BlockLength
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
                required(:info).hash do
                  required(:tier).filled(:integer, gteq?: 1, lteq?: 4)
                  required(:base_score).filled(:string, max_size?: 100)
                  required(:bonuses).hash do
                    required(:thresholds).hash do
                      required(:major).filled(:string, max_size?: 100)
                      required(:severe).filled(:string, max_size?: 100)
                    end
                  end
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
            # rubocop: enable Metrics/BlockLength

            private

            def do_prepare(input) # rubocop: disable Metrics/AbcSize
              input[:modifiers] ||= {}
              input[:modifiers][:armor_score] = { type: 'add', value: input.dig(:info, :base_score) }
              input[:modifiers]['damage_thresholds.major'] =
                { type: 'add', value: input.dig(:info, :bonuses, :thresholds, :major) }
              input[:modifiers]['damage_thresholds.severe'] =
                { type: 'add', value: input.dig(:info, :bonuses, :thresholds, :severe) }

              input[:name].transform_values! { |value| sanitize(value) }
              input[:description].transform_values! { |value| sanitize(value) }
              input[:kind] = 'armor'
              input[:info] = input[:info].except(:base_score, :bonuses)
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
