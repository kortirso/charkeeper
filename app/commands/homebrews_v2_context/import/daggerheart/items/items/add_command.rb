# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Items
        module Items
          class AddCommand < BaseCommand
            use_contract do
              BonusTypes = Dry::Types['strict.string'].enum('static', 'dynamic')
              Kinds = Dry::Types['strict.string'].enum(
                'item', 'recipe', 'armor', 'primary weapon', 'secondary weapon', 'consumables'
              )

              params do
                required(:user).filled(type?: ::User)
                required(:kind).filled(Kinds)
                required(:name).hash do
                  required(:en).filled(:string, max_size?: 50)
                  optional(:ru).maybe(:string, max_size?: 50)
                  optional(:es).maybe(:string, max_size?: 50)
                end
                required(:description).hash do
                  optional(:en).maybe(:string, max_size?: 500)
                  optional(:ru).maybe(:string, max_size?: 500)
                  optional(:es).maybe(:string, max_size?: 500)
                end
                optional(:public).filled(:bool)
                optional(:item_names).maybe(:array).each(:string, max_size?: 50)
                optional(:info).hash
              end
            end

            private

            def do_prepare(input)
              input[:name].transform_values! { |value| sanitize(value) }
              input[:description].transform_values! { |value| sanitize(value) }
            end

            def do_persist(input)
              result = ::Daggerheart::Item.create!(input.except(:item, :item_names))

              if input[:kind] == 'recipe' && input[:item_names]&.any?
                input[:item_names].each do |item_name|
                  item =
                    ::Daggerheart::Item.find_by("name ->> 'en' = ? OR name ->> 'ru' = ?", item_name, item_name)
                  next unless item

                  ::Item::Recipe.create!(input.slice(:user, :public).merge(tool: result, item: item))
                end
              end

              { result: result }
            end
          end
        end
      end
    end
  end
end
