# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Pathfinder2
      module Races
        class AddCommand < BaseCommand
          include Deps[
            cache: 'cache.pathfinder2_names'
          ]

          private

          def do_persist(input)
            result = ActiveRecord::Base.transaction do
              race = ::Pathfinder2::Homebrews::Race.create!(input.slice(:user, :title, :description, :public, :info))
              input[:features]&.each do |feature|
                add_feat.call(
                  feature.except(:id).merge({ origin_value: race.id })
                )
              end
              race
            end

            cache.push_item(key: :races, item: result)

            { result: result }
          end

          def add_feat = HomebrewsV2Context::Import::Pathfinder2::Feats::AddCommand.new
        end
      end
    end
  end
end
