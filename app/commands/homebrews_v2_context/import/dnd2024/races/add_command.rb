# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Dnd2024
      module Races
        class AddCommand < BaseCommand
          include Deps[
            cache: 'cache.dnd_names'
          ]

          private

          def do_persist(input)
            result = ActiveRecord::Base.transaction do
              race = ::Dnd2024::Homebrews::Race.create!(input.slice(:user, :title, :description, :public, :info))
              input[:features]&.each do |feature|
                add_feat.call(
                  feature.except(:id).merge({
                    user: input[:user],
                    origin: 'species',
                    origin_value: race.id
                  })
                )
              end
              race
            end

            cache.push_item(key: :races, item: result)

            { result: result }
          end

          def add_feat = HomebrewsV2Context::Import::Dnd2024::Feats::AddCommand.new
        end
      end
    end
  end
end
