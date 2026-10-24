# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Pathfinder2
      module Subraces
        class AddCommand < BaseCommand
          include Deps[
            cache: 'cache.pathfinder2_names'
          ]

          private

          def do_persist(input)
            result = ActiveRecord::Base.transaction do
              subrace = ::Pathfinder2::Homebrews::Subrace.create!(input.slice(:user, :title, :description, :public, :info))
              input[:features]&.each do |feature|
                add_feat.call(
                  feature.except(:id).merge({ origin_value: subrace.id })
                )
              end
              subrace
            end

            cache.push_item(key: :subraces, item: result)

            { result: result }
          end

          def add_feat = HomebrewsV2Context::Import::Pathfinder2::Feats::AddCommand.new
        end
      end
    end
  end
end
