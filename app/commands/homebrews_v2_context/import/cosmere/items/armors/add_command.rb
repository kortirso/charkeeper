# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Cosmere
      module Items
        module Armors
          class AddCommand < BaseCommand
            # rubocop: disable-next Metrics/BlockLength
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
                required(:deflect).filled(:integer, gteq?: 0)
                optional(:tooltips).hash do
                  optional(:presentable).filled(:bool)
                  optional(:fragile).filled(:bool)
                  optional(:dangerous).filled(:bool)
                  optional(:cumbersome).filled(:integer, gteq?: 1)
                end
                optional(:expert_tooltips).hash do
                  optional(:presentable).filled(:bool)
                  optional(:fragile).filled(:bool)
                  optional(:dangerous).filled(:bool)
                  optional(:cumbersome).filled(:integer, gteq?: 1)
                end
                optional(:modifiers).hash
                optional(:public).filled(:bool)
                optional(:only).maybe(:array, min_size?: 1).each(:string)
              end
            end

            private

            def do_prepare(input) # rubocop: disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
              input[:slug] = "#{SecureRandom.uuid}-slug"
              input[:name].transform_values! { |value| sanitize(value) }
              input[:description]&.transform_values! { |value| sanitize(value) }
              input[:kind] = 'armor'
              input[:tooltips] = input[:tooltips].filter_map do |key, value|
                next key if value == true
                next "#{key}-#{value}" if value.is_a?(Integer) && value.positive?

                nil
              end
              input[:expert_tooltips] = input[:expert_tooltips].filter_map do |key, value|
                next key if value == true
                next "#{key}-#{value}" if value.is_a?(Integer) && value.positive?

                nil
              end
              input[:info] = input.slice(:only, :deflect, :tooltips, :expert_tooltips)
            end

            def do_persist(input)
              result = ::Cosmere::Item.create!(input.except(:only, :deflect, :tooltips, :expert_tooltips))

              { result: result }
            end
          end
        end
      end
    end
  end
end
