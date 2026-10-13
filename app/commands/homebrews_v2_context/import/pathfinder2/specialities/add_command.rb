# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Pathfinder2
      module Specialities
        class AddCommand < BaseCommand
          include Deps[
            add_feat: 'commands.homebrews_v2_context.import.pathfinder2.feats.add',
            cache: 'cache.pathfinder2_names'
          ]

          private

          def do_persist(input)
            result = ActiveRecord::Base.transaction do
              speciality = ::Pathfinder2::Homebrews::Speciality.create!(input.slice(:user, :title, :description, :public, :info))
              input[:features]&.each do |feature|
                add_feat.call(
                  feature.except(:id).merge({ origin_value: speciality.id })
                )
              end
              speciality
            end

            cache.push_item(key: :specialities, item: result)

            { result: result }
          end
        end
      end
    end
  end
end
