# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Cosmere
      module Items
        module Weapons
          class AddCommand < BaseCommand
            # rubocop: disable-next Metrics/BlockLength
            use_contract do
              Skills = Dry::Types['strict.string'].enum('light_weaponry', 'heavy_weaponry')
              Types = Dry::Types['strict.string'].enum('melee', 'range')
              DamageTypes = Dry::Types['strict.string'].enum('keen', 'impact', 'spirit')

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
                optional(:tooltips).hash do
                  optional(:dangerous).filled(:bool)
                  optional(:deadly).filled(:bool)
                  optional(:defensive).filled(:bool)
                  optional(:discreet).filled(:bool)
                  optional(:fragile).filled(:bool)
                  optional(:indirect).filled(:bool)
                  optional(:momentum).filled(:bool)
                  optional(:offhand).filled(:bool)
                  optional(:pierce).filled(:bool)
                  optional(:quickdraw).filled(:bool)
                  optional(:single_use).filled(:bool)
                  optional(:two_handed).filled(:bool)
                  optional(:blast).filled(:integer, gteq?: 1)
                  optional(:cumbersome).filled(:integer, gteq?: 1)
                  optional(:loaded).filled(:integer, gteq?: 1)
                  optional(:thrown).filled(:string)
                end
                optional(:expert_tooltips).hash do
                  optional(:dangerous).filled(:bool)
                  optional(:deadly).filled(:bool)
                  optional(:defensive).filled(:bool)
                  optional(:discreet).filled(:bool)
                  optional(:fragile).filled(:bool)
                  optional(:indirect).filled(:bool)
                  optional(:momentum).filled(:bool)
                  optional(:offhand).filled(:bool)
                  optional(:pierce).filled(:bool)
                  optional(:quickdraw).filled(:bool)
                  optional(:single_use).filled(:bool)
                  optional(:two_handed).filled(:bool)
                  optional(:blast).filled(:integer, gteq?: 1)
                  optional(:cumbersome).filled(:integer, gteq?: 1)
                  optional(:loaded).filled(:integer, gteq?: 1)
                  optional(:thrown).filled(:string)
                end
                optional(:modifiers).hash
                optional(:public).filled(:bool)
                optional(:only).maybe(:array, min_size?: 1).each(:string)
                required(:info).hash do
                  required(:weapon_skill).filled(Skills)
                  required(:type).filled(Types)
                  required(:damage).filled(:string)
                  required(:damage_type).filled(DamageTypes)
                  optional(:dist).filled(:string)
                  optional(:features).maybe(:array).each(:hash) do
                    required(:en).filled(:string, max_size?: 500)
                    optional(:ru).maybe(:string, max_size?: 500)
                    optional(:es).maybe(:string, max_size?: 500)
                  end
                end
                optional(:charges).filled(:integer, gteq?: 1)
              end
            end

            private

            def do_prepare(input) # rubocop: disable Metrics/AbcSize, Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
              input[:slug] = "#{SecureRandom.uuid}-slug"
              input[:name].transform_values! { |value| sanitize(value) }
              input[:description]&.transform_values! { |value| sanitize(value) }
              input[:kind] = 'weapon'
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
              input[:info].merge!(input.slice(:only, :tooltips, :expert_tooltips))
            end

            def do_persist(input)
              result = ::Cosmere::Item.create!(input.except(:only, :tooltips, :expert_tooltips))

              { result: result }
            end
          end
        end
      end
    end
  end
end
