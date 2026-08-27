# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Dnd2024
      module Items
        module Weapons
          class AddCommand < BaseCommand
            # rubocop: disable Metrics/BlockLength
            use_contract do
              Types = Dry::Types['strict.string'].enum('melee', 'thrown', 'range')
              Skills = Dry::Types['strict.string'].enum('light', 'martial')
              Masteries = Dry::Types['strict.string'].enum('topple', 'sap', 'slow', 'nick', 'push', 'vex', 'cleave', 'graze')
              Tooltips = Dry::Types['strict.string'].enum('light', 'finesse', '2handed', 'reload', 'reach', 'heavy')

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
                  required(:weight).filled(:integer, gteq?: 1, lteq?: 1_000)
                end
                required(:info).hash do
                  required(:weapon_skill).maybe(Skills)
                  required(:type).maybe(Types)
                  required(:caption).maybe(:array).each(Tooltips)
                  optional(:damage).filled(:string)
                  optional(:damage_type).filled(:string)
                  optional(:mastery).filled(Masteries)
                  optional(:dist).filled(:string)
                  optional(:versatile).filled(:string)
                  optional(:features).maybe(:array).each(:hash) do
                    required(:en).filled(:string, max_size?: 500)
                    optional(:ru).maybe(:string, max_size?: 500)
                    optional(:es).maybe(:string, max_size?: 500)
                  end
                end
                optional(:charges).filled(:integer, gteq?: 1)
                optional(:modifiers).hash
                optional(:public).filled(:bool)
              end
            end
            # rubocop: enable Metrics/BlockLength

            private

            def do_prepare(input) # rubocop: disable Metrics/AbcSize
              input[:name].transform_values! { |value| sanitize(value) }
              input[:description].transform_values! { |value| sanitize(value) } if input.key?(:description)
              input[:info][:caption] = (input[:info][:caption] || []).index_with { true }
              input[:info][:caption][:versatile] = input[:versatile] if input[:info].key?(:versatile)
              input[:info] = input[:info].except(:versatile)
              input[:slug] = SecureRandom.uuid
              input[:kind] = 'weapon'
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
