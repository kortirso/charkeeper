# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Pathfinder2
      module Items
        module Weapons
          class AddCommand < BaseCommand
            # rubocop: disable-next Metrics/BlockLength
            use_contract do
              Groups = Dry::Types['strict.string'].enum(
                'club', 'sword', 'spear', 'knife', 'brawling', 'polearm', 'axe', 'hammer', 'pick', 'flail', 'crossbow', 'sling',
                'dart', 'bow'
              )
              Types = Dry::Types['strict.string'].enum('melee', 'range')
              Skills = Dry::Types['strict.string'].enum('simple', 'martial', 'advanced')

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
                  required(:weight).filled(:integer, gteq?: 0, lteq?: 10)
                end
                required(:info).hash do
                  required(:weapon_skill).maybe(Skills)
                  required(:group).maybe(Groups)
                  required(:type).maybe(Types)
                  required(:tooltips).maybe(:array).each(:string)
                  required(:damage).filled(:string)
                  required(:damage_type).filled(:string)
                  required(:burden).filled(:integer, gteq?: 1, lteq?: 2)
                  optional(:dist).filled(:integer, gteq?: 1, lteq?: 2)
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

            private

            def do_prepare(input)
              input[:name].transform_values! { |value| sanitize(value) }
              input[:description].transform_values! { |value| sanitize(value) } if input.key?(:description)
              input[:slug] = SecureRandom.uuid
              input[:kind] = 'weapon'
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
